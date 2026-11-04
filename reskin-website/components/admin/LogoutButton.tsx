"use client";
export function LogoutButton() {
  return (
    <button
      type="button"
      className="btn btn-outline min-h-10 px-4"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
    >
      Abmelden
    </button>
  );
}
