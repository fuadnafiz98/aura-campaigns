export interface Email {
  _id?: string;
  id?: string;
  subject: string;
  body: string;
  delay: number;
  delayUnit: "minutes" | "hours" | "days";
}
