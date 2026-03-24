"use client";

import { useState, useRef } from "react";

const DIRECTIONS_REGIONALES = [
  "BORDEAUX",
  "LE MANS",
  "LILLE",
  "LYON",
  "MARSEILLE",
  "NANTES",
  "PARIS",
  "STRASBOURG",
];

const MOIS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

interface FileUploadProps {
  label: string;
  required?: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

function FileUpload({ label, required, file, onFileChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileChange(droppedFile);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    onFileChange(selected);
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : file
            ? "border-green-400 bg-green-50"
            : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/30"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
        />
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <svg
              className="w-6 h-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm text-gray-700 font-medium">
              {file.name}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
              }}
              className="ml-2 text-red-400 hover:text-red-600 text-xs"
            >
              Supprimer
            </button>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto w-10 h-10 text-blue-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm font-medium text-gray-600">
              Parcourir les fichiers
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Glissez-déposez des fichiers ici
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [direction, setDirection] = useState("");
  const [mois, setMois] = useState("");
  const [email, setEmail] = useState("");
  const [partNombre, setPartNombre] = useState<File | null>(null);
  const [partMontant, setPartMontant] = useState<File | null>(null);
  const [pefNombre, setPefNombre] = useState<File | null>(null);
  const [pefMontant, setPefMontant] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!direction || !mois) {
      setMessage({
        type: "error",
        text: "Veuillez remplir la direction régionale et le mois.",
      });
      return;
    }

    if (!partNombre || !partMontant || !pefNombre || !pefMontant) {
      setMessage({
        type: "error",
        text: "Veuillez charger les 4 fichiers (un par catégorie).",
      });
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("direction", direction);
      formData.append("mois", mois);
      formData.append("email", email);
      if (partNombre) formData.append("particuliers_nombre", partNombre);
      if (partMontant) formData.append("particuliers_montant", partMontant);
      if (pefNombre) formData.append("pef_nombre", pefNombre);
      if (pefMontant) formData.append("pef_montant", pefMontant);

      const res = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      setSubmitted(true);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erreur lors de l'envoi",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Résultats envoyés !
          </h1>
          <p className="text-gray-600 mb-2">
            Vos résultats commerciaux pour <span className="font-semibold">{direction}</span> du mois de <span className="font-semibold">{mois}</span> ont bien été transmis.
          </p>
          {email && (
            <p className="text-gray-500 text-sm mb-6">
              Une confirmation sera envoyée à <span className="font-medium">{email}</span>.
            </p>
          )}
          <button
            onClick={() => {
              setSubmitted(false);
              setDirection("");
              setMois("");
              setEmail("");
              setPartNombre(null);
              setPartMontant(null);
              setPefNombre(null);
              setPefMontant(null);
              setMessage(null);
            }}
            className="mt-4 bg-gradient-to-r from-blue-800 to-blue-950 text-white font-semibold py-3 px-8 rounded-lg hover:from-blue-900 hover:to-blue-950 transition-all"
          >
            Nouvelle soumission
          </button>
        </div>
        <p className="text-xs text-white/70 mt-6">
          Sagamm - Pilotage Commercial
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4">
      {/* Logo */}
      <div className="mb-6">
        <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-red-500 via-blue-500 to-green-500 bg-clip-text text-transparent">
            Sagamm
          </span>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">
          Résultats commerciaux
        </h1>
        <p className="text-center text-blue-600 text-sm font-medium mb-8">
          Pilotage - Résultats mensuels par région
        </p>

        <form onSubmit={handleSubmit}>
          {/* Direction régionale */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Direction régionale <span className="text-red-500">*</span>
            </label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            >
              <option value="">Veuillez sélectionner</option>
              {DIRECTIONS_REGIONALES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Mois */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mois <span className="text-red-500">*</span>
            </label>
            <select
              value={mois}
              onChange={(e) => setMois(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            >
              <option value="">Veuillez sélectionner</option>
              {MOIS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* File uploads */}
          <FileUpload
            label="PARTICULIERS - En NOMBRE"
            required
            file={partNombre}
            onFileChange={setPartNombre}
          />

          <FileUpload
            label="PARTICULIERS - En MONTANT"
            required
            file={partMontant}
            onFileChange={setPartMontant}
          />

          <FileUpload
            label="PEF - En NOMBRE"
            required
            file={pefNombre}
            onFileChange={setPefNombre}
          />

          <FileUpload
            label="PEF - En MONTANT"
            required
            file={pefMontant}
            onFileChange={setPefMontant}
          />

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mettez votre email si vous souhaitez recevoir une confirmation
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@exemple.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-blue-800 to-blue-950 text-white font-semibold py-3 rounded-lg hover:from-blue-900 hover:to-blue-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Envoi en cours..." : "Envoyer"}
          </button>
        </form>
      </div>

      <p className="text-xs text-white/70 mt-6">
        Sagamm - Pilotage Commercial
      </p>
    </div>
  );
}
