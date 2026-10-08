import type { RequestHandler } from "express";

const POSITIVE_INTEGER_ID = /^[1-9]\d*$/;

/** Valida y normaliza el ID positivo recibido en los parámetros de ruta. */
export const validateId: RequestHandler = (req, res, next): void => {
  const rawId = req.params.id;

  if (typeof rawId !== "string" || !POSITIVE_INTEGER_ID.test(rawId)) {
    res.status(400).json({ message: "El ID debe ser un entero positivo." });
    return;
  }

  const id = Number(rawId);
  if (!Number.isSafeInteger(id)) {
    res.status(400).json({ message: "El ID debe ser un entero positivo seguro." });
    return;
  }

  // Se guarda el número normalizado para que el controlador no lo convierta otra vez.
  res.locals.incidentId = id;
  next();
};
