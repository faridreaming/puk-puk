import { CreateHabitForm } from "~/components/CreateHabitForm";
import { PageShell } from "~/components/ui/PageShell";

export function meta() {
  return [
    { title: "Buat Kebiasaan Baru - Pukpuk" },
  ];
}

export default function CreatePage() {
  return (
    <PageShell title="Kebiasaan Baru" backTo="/">
      <CreateHabitForm />
    </PageShell>
  );
}
