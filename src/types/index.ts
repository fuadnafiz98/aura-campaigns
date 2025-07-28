export interface Email {
  id: string;
  subject: string;
  body: string;
  delay: number;
  delayUnit: "minutes" | "hours" | "days";
}
