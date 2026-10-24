import { Alert } from "@platform/ui/alert";

export default function Page() {
  return (
    <main>
      <Alert.Root variant="warning">
        <Alert.Title>Your trial ends in 3 days</Alert.Title>
        <Alert.Close />
      </Alert.Root>
    </main>
  );
}
