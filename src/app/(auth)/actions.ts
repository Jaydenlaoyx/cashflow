"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function getRequiredString(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function getErrorUrl(path: string, message: string) {
  return `${path}?error=${encodeURIComponent(message)}`;
}

export async function signIn(formData: FormData) {
  const email = getRequiredString(formData, "email");
  const password = getRequiredString(formData, "password");

  if (!email || !password) {
    redirect(getErrorUrl("/login", "Email and password are required."));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(getErrorUrl("/login", error.message));
  }

  redirect("/");
}

export async function signUp(formData: FormData) {
  const name = getRequiredString(formData, "name");
  const email = getRequiredString(formData, "email");
  const password = getRequiredString(formData, "password");
  const confirmPassword = getRequiredString(formData, "confirmPassword");

  if (!name || !email || !password || !confirmPassword) {
    redirect(getErrorUrl("/register", "All fields are required."));
  }

  if (password.length < 8) {
    redirect(
      getErrorUrl(
        "/register",
        "Your password must contain at least 8 characters.",
      ),
    );
  }

  if (password !== confirmPassword) {
    redirect(getErrorUrl("/register", "The passwords do not match."));
  }

  const requestHeaders = await headers();
  const origin =
    requestHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(getErrorUrl("/register", error.message));
  }

  if (data.session) {
    redirect("/");
  }

  redirect(`/check-email?email=${encodeURIComponent(email)}`);
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}