import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export function HomePage() {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">
                Building Your Application
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-muted/50 aspect-video rounded-xl" />
          <div className="bg-muted/50 aspect-video rounded-xl" />
          <div className="bg-muted/50 aspect-video rounded-xl" />
        </div>
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </div>
    </SidebarInset>
  );
}

// export function HomePage() {
//   const { viewer, numbers } =
//     useQuery(api.myFunctions.listNumbers, {
//       count: 10,
//     }) ?? {};
//   const addNumber = useMutation(api.myFunctions.addNumber);
//   const sendMail = useAction(api.sendMail.sendTestEmail);

//   if (viewer === undefined || numbers === undefined) {
//     return (
//       <div className="mx-auto">
//         <p>loading... (consider a loading skeleton)</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col gap-8 max-w-lg mx-auto">
//       <p>Welcome {viewer ?? "Anonymous"}!</p>
//       <p>
//         Click the button below and open this page in another window - this data
//         is persisted in the Convex cloud database!
//       </p>
//       <p>
//         <Button
//           className="cursor-pointer"
//           onClick={() => {
//             void addNumber({ value: Math.floor(Math.random() * 10) });
//           }}
//         >
//           Add a random number
//         </Button>
//       </p>
//       <p>
//         Numbers:{" "}
//         {numbers?.length === 0
//           ? "Click the button!"
//           : (numbers?.join(", ") ?? "...")}
//       </p>
//       {/*
//       <Button
//         className="cursor-pointer"
//         onClick={async () => {
//           const resp = await sendMail();
//           console.log(resp);
//         }}
//       >
//         Send Demo Email
//       </Button>
//       */}
//     </div>
//   );
// }
