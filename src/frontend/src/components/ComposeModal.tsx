import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRewriteBody } from "../hooks/useQueries";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ComposeModal({ open, onClose }: Props) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [tone, setTone] = useState("Professional");
  const rewrite = useRewriteBody();

  const handleRewrite = async () => {
    if (!body.trim()) {
      toast.error("Write something first");
      return;
    }
    try {
      const result = await rewrite.mutateAsync({ body, tone });
      setBody(result);
      toast.success(`Body rewritten in ${tone} tone`);
    } catch {
      toast.error("AI rewrite failed");
    }
  };

  const handleSend = () => {
    if (!to.trim() || !subject.trim()) {
      toast.error("Please fill in To and Subject");
      return;
    }
    toast.success("Email sent successfully!");
    setTo("");
    setSubject("");
    setBody("");
    onClose();
  };

  const handleClose = () => {
    setTo("");
    setSubject("");
    setBody("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        data-ocid="compose.dialog"
        className="sm:max-w-xl border-border bg-popover"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">
            New Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="compose-to"
              className="text-xs text-muted-foreground"
            >
              To
            </Label>
            <Input
              id="compose-to"
              data-ocid="compose.to.input"
              placeholder="recipient@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="compose-subject"
              className="text-xs text-muted-foreground"
            >
              Subject
            </Label>
            <Input
              id="compose-subject"
              data-ocid="compose.subject.input"
              placeholder="Re: Project update"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="compose-body"
              className="text-xs text-muted-foreground"
            >
              Body
            </Label>
            <Textarea
              id="compose-body"
              data-ocid="compose.body.textarea"
              placeholder="Write your message…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="bg-input border-border min-h-[160px] resize-none"
            />
          </div>

          {/* AI Rewrite row */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
            <Brain className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm text-muted-foreground flex-1">
              AI Rewrite tone:
            </span>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger
                data-ocid="compose.tone.select"
                className="w-36 h-8 text-xs bg-input border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Concise">Concise</SelectItem>
              </SelectContent>
            </Select>
            <Button
              data-ocid="compose.ai_rewrite.button"
              size="sm"
              variant="outline"
              className="h-8 text-xs border-primary/30 text-primary hover:bg-primary/10"
              onClick={handleRewrite}
              disabled={rewrite.isPending}
            >
              {rewrite.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Brain className="h-3 w-3 mr-1" />
              )}
              Rewrite
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
          <Button
            data-ocid="compose.submit_button"
            onClick={handleSend}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
