import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET = "resultats-commerciaux";

const WEBHOOK_URL =
  "https://n8n.srv795917.hstgr.cloud/webhook/4324ed98-5f42-49a0-9860-d04f1d387b45";

async function uploadFile(
  file: File,
  direction: string,
  mois: string,
  category: string
): Promise<string> {
  const timestamp = Date.now();
  const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9._-]/g, "_");
  const safeName = sanitize(file.name);
  const path = `${sanitize(direction)}/${sanitize(mois)}/${sanitize(category)}/${timestamp}_${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) {
    throw new Error(`Erreur upload ${category}: ${error.message}`);
  }

  return path;
}

async function getSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 86400); // 24 heures

  if (error) {
    throw new Error(`Erreur lien signé: ${error.message}`);
  }

  return data.signedUrl;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const direction = formData.get("direction") as string;
    const mois = formData.get("mois") as string;
    const email = (formData.get("email") as string) || null;

    const partNombre = formData.get("particuliers_nombre") as File | null;
    const partMontant = formData.get("particuliers_montant") as File | null;
    const pefNombre = formData.get("pef_nombre") as File | null;
    const pefMontant = formData.get("pef_montant") as File | null;

    if (!direction || !mois) {
      return NextResponse.json(
        { error: "Les champs Direction et Mois sont obligatoires." },
        { status: 400 }
      );
    }

    // Upload files (only those provided)
    const partNombrePath = partNombre
      ? await uploadFile(partNombre, direction, mois, "particuliers_nombre")
      : "";
    const partMontantPath = partMontant
      ? await uploadFile(partMontant, direction, mois, "particuliers_montant")
      : "";
    const pefNombrePath = pefNombre
      ? await uploadFile(pefNombre, direction, mois, "pef_nombre")
      : "";
    const pefMontantPath = pefMontant
      ? await uploadFile(pefMontant, direction, mois, "pef_montant")
      : "";

    // Insert record in database
    const { error: dbError } = await supabase.from("submissions").insert({
      direction_regionale: direction,
      mois,
      email,
      particuliers_nombre_path: partNombrePath,
      particuliers_montant_path: partMontantPath,
      pef_nombre_path: pefNombrePath,
      pef_montant_path: pefMontantPath,
    });

    if (dbError) {
      throw new Error(`Erreur base de données: ${dbError.message}`);
    }

    // Generate signed URLs (valid 24h) for uploaded files
    const fichiers: Record<string, string> = {};
    if (partNombrePath) {
      fichiers.particuliers_nombre = await getSignedUrl(partNombrePath);
    }
    if (partMontantPath) {
      fichiers.particuliers_montant = await getSignedUrl(partMontantPath);
    }
    if (pefNombrePath) {
      fichiers.pef_nombre = await getSignedUrl(pefNombrePath);
    }
    if (pefMontantPath) {
      fichiers.pef_montant = await getSignedUrl(pefMontantPath);
    }

    // Send to n8n webhook
    const webhookPayload = {
      direction_regionale: direction,
      mois,
      email,
      fichiers,
      soumis_le: new Date().toISOString(),
    };

    const webhookRes = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookRes.ok) {
      console.error("Webhook error:", webhookRes.status, await webhookRes.text());
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
