"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("bd6a9b13-8959-4466-a60b-9c0743036fcd");
  }, []);

  return null;
};
