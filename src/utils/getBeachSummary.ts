import { BeachStatus } from "../types/beach";

interface SummaryInput {
  temp: number;
  wind: number;
  wave_height: number;
  status: BeachStatus;
}

function getWindDescription(wind: number): string {
  if (wind < 8) {
    return "vento fraco";
  }

  if (wind < 15) {
    return "vento moderado";
  }

  return "vento forte";
}

function getStatusDescription(status: BeachStatus): string {
  if (status === "GOOD") {
    return "condições boas para praia";
  }

  if (status === "MEDIUM") {
    return "condições medianas para praia";
  }

  return "condições ruins para praia";
}

export function getBeachSummary(data: SummaryInput): string {
  const waveText = `Ondas de ${data.wave_height.toFixed(1)}m`;
  const windText = `com ${getWindDescription(data.wind)}`;
  const statusText = getStatusDescription(data.status);

  return `${waveText}, ${windText} e ${statusText}.`;
}
