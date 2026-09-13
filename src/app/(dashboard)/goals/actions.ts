"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const goalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(80),
  targetAmount: z.coerce
    .number()
    .positive()
    .max(999999999999.99),
  initialAmount: z.coerce
    .number()
    .min(0)
    .max(999999999999.99),
  targetDate: z.union([
    z.literal(""),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ]),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/),
});

const contributionSchema = z.object({
  amount: z.coerce
    .number()
    .positive()
    .max(999999999999.99),
  contributionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().trim().max(300),
});

async function getAuthenticatedUserId() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string") {
    redirect("/login");
  }

  return {
    supabase,
    userId,
  };
}

export async function createGoal(formData: FormData) {
  const result = goalSchema.safeParse({
    name: formData.get("name"),
    targetAmount: formData.get("targetAmount"),
    initialAmount: formData.get("initialAmount"),
    targetDate: formData.get("targetDate") ?? "",
    color: formData.get("color"),
  });

  if (!result.success) {
    redirect("/goals?error=invalid-goal");
  }

  const { supabase, userId } =
    await getAuthenticatedUserId();

  const goal = result.data;

  if (goal.initialAmount > goal.targetAmount) {
    redirect("/goals?error=initial-amount");
  }

  const { error } = await supabase
    .from("savings_goals")
    .insert({
      user_id: userId,
      name: goal.name,
      target_amount: goal.targetAmount,
      initial_amount: goal.initialAmount,
      target_date: goal.targetDate || null,
      color: goal.color,
      is_completed:
        goal.initialAmount >= goal.targetAmount,
    });

  if (error) {
    console.error("Goal creation failed:", error);
    redirect("/goals?error=create-failed");
  }

  revalidatePath("/");
  revalidatePath("/goals");

  redirect("/goals?created=true");
}

export async function addGoalContribution(
  goalId: string,
  formData: FormData,
) {
  const goalIdResult = z.string().uuid().safeParse(goalId);

  const result = contributionSchema.safeParse({
    amount: formData.get("amount"),
    contributionDate: formData.get("contributionDate"),
    notes: formData.get("notes") ?? "",
  });

  if (!goalIdResult.success || !result.success) {
    redirect("/goals?error=invalid-contribution");
  }

  const { supabase, userId } =
    await getAuthenticatedUserId();

  const { data: goal, error: goalError } = await supabase
    .from("savings_goals")
    .select("id, target_amount, initial_amount")
    .eq("id", goalId)
    .eq("user_id", userId)
    .maybeSingle();

  if (goalError || !goal) {
    redirect("/goals?error=goal-not-found");
  }

  const contribution = result.data;

  const { error } = await supabase
    .from("goal_contributions")
    .insert({
      user_id: userId,
      goal_id: goalId,
      amount: contribution.amount,
      contribution_date: contribution.contributionDate,
      notes: contribution.notes || null,
    });

  if (error) {
    console.error("Goal contribution failed:", error);
    redirect("/goals?error=contribution-failed");
  }

  const { data: contributions } = await supabase
    .from("goal_contributions")
    .select("amount")
    .eq("goal_id", goalId)
    .eq("user_id", userId);

  const contributionTotal = (contributions ?? []).reduce(
    (total, item) => total + Number(item.amount),
    0,
  );

  const currentAmount =
    Number(goal.initial_amount) + contributionTotal;

  if (currentAmount >= Number(goal.target_amount)) {
    await supabase
      .from("savings_goals")
      .update({
        is_completed: true,
      })
      .eq("id", goalId)
      .eq("user_id", userId);
  }

  revalidatePath("/");
  revalidatePath("/goals");

  redirect("/goals?contributed=true");
}

export async function deleteGoal(goalId: string) {
  const result = z.string().uuid().safeParse(goalId);

  if (!result.success) {
    redirect("/goals?error=invalid-goal");
  }

  const { supabase, userId } =
    await getAuthenticatedUserId();

  const { error } = await supabase
    .from("savings_goals")
    .delete()
    .eq("id", goalId)
    .eq("user_id", userId);

  if (error) {
    console.error("Goal deletion failed:", error);
    redirect("/goals?error=delete-failed");
  }

  revalidatePath("/");
  revalidatePath("/goals");

  redirect("/goals?deleted=true");
}