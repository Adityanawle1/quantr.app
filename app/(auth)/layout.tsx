export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Auth pages use their own full-page layout from auth-form.tsx
  // No wrapper needed — the form handles background, layout, and ticker
  return <>{children}</>;
}
