import { useState } from "react";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Bell, BellOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** Short label of the change e.g. "Added meal · Greek yogurt + berries" */
  changeLabel: string;
  /** Defaults the message a clinician will send to the user. */
  defaultMessage?: string;
  /** Called only after user confirms. notify=true means send a push-style notification. */
  onConfirm: (notify: boolean, message?: string) => void;
}

/**
 * Lightweight confirm-with-notify dialog. Shown before any clinician change
 * is committed so they can opt-in to notifying the patient.
 */
export const NotifyUserDialog = ({ open, onOpenChange, changeLabel, defaultMessage, onConfirm }: Props) => {
  const [notify, setNotify] = useState(true);
  const [msg, setMsg] = useState(defaultMessage ?? "");

  // Reset internal state whenever the dialog re-opens so it picks up the new label/default.
  const handleOpenChange = (o: boolean) => {
    if (o) {
      setNotify(true);
      setMsg(defaultMessage ?? "");
    }
    onOpenChange(o);
  };

  const confirm = () => {
    onConfirm(notify, notify ? msg.trim() || changeLabel : undefined);
    if (notify) {
      toast({ title: "Notification sent", description: "Patient will see this update on their next sync." });
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm change</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="block text-foreground font-medium mt-1">{changeLabel}</span>
            <span className="block mt-1 text-xs">This change will be reflected in the patient's plan immediately.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-border bg-surface p-3 space-y-3">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="inline-flex items-center gap-2 text-sm">
              {notify ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
              Notify patient about this change
            </span>
            <Switch checked={notify} onCheckedChange={setNotify} />
          </label>
          {notify && (
            <Textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder={changeLabel}
              className="text-xs min-h-[60px]"
            />
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirm}>Confirm{notify ? " & notify" : ""}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
