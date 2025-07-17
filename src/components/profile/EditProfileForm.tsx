import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserProfile, updateUserProfile } from "@/services/userService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const profileFormSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters.").max(60),
  phone_number: z.string().length(10, "Phone number must be 10 digits."),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileFormProps {
  profile: UserProfile;
  onSuccess: () => void;
  setOpen: (open: boolean) => void;
}

export const EditProfileForm = ({ profile, onSuccess, setOpen }: EditProfileFormProps) => {
  const { user } = useAuth();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile.full_name || "",
      phone_number: profile.phone_number || "",
    },
    mode: "onChange",
  });

  async function onSubmit(data: ProfileFormValues) {
    if (!user) {
      toast.error("You must be logged in to update your profile.");
      return;
    }

    const toastId = toast.loading("Updating profile...");

    try {
      const updatedProfile = await updateUserProfile(user.id, {
        full_name: data.full_name,
        phone_number: data.phone_number,
      });
      
      toast.dismiss(toastId);

      if (updatedProfile) {
        toast.success("Profile updated successfully!");
        onSuccess();
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to update profile. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Your 10-digit phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
