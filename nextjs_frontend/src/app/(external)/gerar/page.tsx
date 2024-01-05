"use client";

import React from "react";
import { serverURL } from "@/config";
import { Acordo } from "../../../models/Acordos";

import Image from "next/image";
import Button from "@/components/Button/button";

async function addTenant(name: string, debit: number) {
  return (await fetch(`${serverURL}/api/test/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nome: name,
      valorDivida: debit
    })
  }).then((response) => response.json())
    .catch((error) => {
      console.error(error);
      return null;
    })) as Acordo;
}

export default function TestPage() {
  const linkRef = React.useRef<HTMLSpanElement>(null);
  const [name, setName] = React.useState<string>("");
  const [debit, setDebit] = React.useState<number>(0);
  const [identifier, setIdentifier] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const urlOrigin = window.location.origin + "/negociacao";

  function handleCopyLink() {
    if (!linkRef.current || typeof window === "undefined") return;
    navigator.clipboard.writeText(`${urlOrigin}/${identifier}`);
    linkRef.current.textContent = "Link copiado!";
  }

  function handleButtonBlur() {
    if (!linkRef.current) return;
    linkRef.current.textContent = "Copiar link";
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    if (name === "nome") {
      setName(value);
    } else {
      setDebit(Number(value));
    }
  };

  async function handleSubmit() {
    if (!name || !debit) return;

    setIsLoading(true);
    const agreement = await addTenant(name, debit);
    if (agreement) {
      setIdentifier(agreement.identificador);
    }
    setName("");
    setDebit(0);
    setIsLoading(false);
  }

  return (
    <div className="flex w-full h-screen justify-center items-center">
      <div className="flex h-min bg-gray-100 justify-center p-4
                      flex-col border-2 rounded-sm">
        <div className="mb-4">
          <label htmlFor="nome" className="font-normal">
            Nome do devedor
          </label>
          <input
            onChange={handleFormChange} required
            className="w-full px-3 py-2 border border-gray-300 shadow rounded-md h-10 focus:ring-primary-500 focus:border-primary-500"
            type="text" name="nome" id="nome"
            placeholder="Digite o Nome do inadimplente"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="valorDivida" className="font-normal">
            Valor da dívida
          </label>
          <input
            onChange={handleFormChange} required
            className="w-full px-3 py-2 border border-gray-300 shadow rounded-md h-10 focus:ring-primary-500 focus:border-primary-500"
            min="0"
            type="number" name="valorDivida" id="valorDivida"
            placeholder="Digite o valor total da dívida"
          />
        </div>
        <Button onClick={handleSubmit} disabled={isLoading}>
          Adicionar
        </Button>
        <button
          onClick={handleCopyLink}
          onBlur={handleButtonBlur}
          className="h-8 px-3 self-end flex items-center justify-between
                     gap-2 bg-white text-sm font-normal text-sky-600
                     rounded-md mt-2 w-96">
          <Image src="/icons/clip.svg" alt="clip" width={21} height={21} />
          <span className="w-full whitespace-nowrap text-ellipsis
                           overflow-hidden">
            {urlOrigin}/{identifier}
          </span>
          <span className="whitespace-nowrap" ref={linkRef}>
            Copiar link
          </span>
        </button>
      </div>
    </div>
  );
}
