// app/(uploaded)/layout.tsx

import NavBar from "@/components/NavBar";

export default function UploadedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black text-green-300 min-h-screen">
      <NavBar />
      <main className="pt-14 px-6">{children}</main>
    </div>
  );
}
