// import React, { useState, useEffect } from "react";
// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Placeholder from "@tiptap/extension-placeholder";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { TiptapToolbar } from "@/components/tiptap/toolbar";

// // Define the Email type with a new 'body' property
// export interface Email {
//   id: string;
//   subject: string;
//   delay: number;
//   delayUnit: "minutes" | "hours" | "days";
//   body: string; // The HTML content from Tiptap
// }

// interface EmailEditDialogProps {
//   email: Email | null;
//   isOpen: boolean;
//   onOpenChange: (isOpen: boolean) => void;
//   onSave: (updatedEmail: Email) => void;
// }

// export function EmailEditDialog({
//   email,
//   isOpen,
//   onOpenChange,
//   onSave,
// }: EmailEditDialogProps) {
//   // Internal state to manage form edits without updating the parent on every keystroke
//   const [subject, setSubject] = useState("");
//   const [delay, setDelay] = useState(0);
//   const [delayUnit, setDelayUnit] = useState<"minutes" | "hours" | "days">(
//     "days",
//   );

//   const editor = useEditor({
//     extensions: [
//       StarterKit.configure({
//         heading: {
//           levels: [2, 3],
//         },
//       }),
//       Placeholder.configure({
//         placeholder: "Write your email content here…",
//       }),
//     ],
//     content: "",
//     editorProps: {
//       attributes: {
//         class:
//           "prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[250px]",
//       },
//     },
//   });

//   // Effect to populate the form and editor when the dialog opens or the email changes
//   useEffect(() => {
//     if (email && editor) {
//       setSubject(email.subject);
//       setDelay(email.delay);
//       setDelayUnit(email.delayUnit);
//       // Set the editor content. Important to compare to avoid unnecessary updates/cursor jumps.
//       if (editor.getHTML() !== email.body) {
//         editor.commands.setContent(email.body);
//       }
//     }
//   }, [email, editor, isOpen]);

//   const handleSaveClick = () => {
//     if (!email || !editor) return;

//     const updatedEmail: Email = {
//       ...email,
//       subject,
//       delay,
//       delayUnit,
//       body: editor.getHTML(),
//     };
//     onSave(updatedEmail);
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[750px] bg-zinc-950 border-zinc-800">
//         <DialogHeader>
//           <DialogTitle>Edit Email</DialogTitle>
//           <DialogDescription>
//             Modify the details of your email. Click save when you're done.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="grid gap-6 py-4">
//           <div className="grid grid-cols-4 items-center gap-4">
//             <Label htmlFor="subject" className="text-right">
//               Subject
//             </Label>
//             <Input
//               id="subject"
//               value={subject}
//               onChange={(e) => setSubject(e.target.value)}
//               className="col-span-3"
//             />
//           </div>

//           <div className="grid grid-cols-4 items-center gap-4">
//             <Label className="text-right">When to send</Label>
//             <div className="col-span-3 grid grid-cols-2 gap-2">
//               <Input
//                 type="number"
//                 value={delay}
//                 onChange={(e) => setDelay(parseInt(e.target.value, 10) || 0)}
//                 min="0"
//               />
//               <Select
//                 value={delayUnit}
//                 onValueChange={(value: "minutes" | "hours" | "days") =>
//                   setDelayUnit(value)
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select unit" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="minutes">Minutes</SelectItem>
//                   <SelectItem value="hours">Hours</SelectItem>
//                   <SelectItem value="days">Days</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <div className="grid w-full gap-2">
//             <Label>Email Body</Label>
//             <div className="rounded-md border border-input">
//               <TiptapToolbar editor={editor} />
//               <EditorContent editor={editor} />
//             </div>
//           </div>
//         </div>

//         <DialogFooter>
//           <Button
//             onClick={handleSaveClick}
//             type="submit"
//             className="bg-primary hover:bg-primary/90"
//           >
//             Save Changes
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
