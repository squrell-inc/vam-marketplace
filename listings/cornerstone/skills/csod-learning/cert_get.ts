import { csod, runTool, text, query } from "./lib/csod.ts";

export async function certGet(args: Record<string, any>) {
  const certificationId = text(args, "certificationId", true, 200);
  const { json } = await csod(
    "GET",
    `/services/api/CertificationDetails/GetCertificationDetails${query({ CertificationId: certificationId })}`,
  );
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(certGet);