import { AlertDialog } from "@abereghici/ui/alert-dialog";

export default function Page() {
  return (
    <main>
      <AlertDialog.Root>
        <AlertDialog.Trigger>Delete</AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Title>Delete project?</AlertDialog.Title>
          <AlertDialog.Description>You can’t undo this.</AlertDialog.Description>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action variant="danger">Delete</AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </main>
  );
}
