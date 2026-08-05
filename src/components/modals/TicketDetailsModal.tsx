import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import {
  MessageSquare,
  User,
  Mail,
  Phone,
  Tag,
  Plus,
  Clock,
  AlertTriangle,
  Edit,
  X,
  FileText,
  Send,
  Check,
  Trash2,
} from "lucide-react";
import { SupportTicket, TicketPriority, TicketStatus, TicketComment } from "@/types/support";
import { updateTicket, fetchTicketComments, createTicketComment, deleteTicket } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface TicketDetailsModalProps {
  ticket: SupportTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdate?: (updatedTicket: SupportTicket) => void;
  onTicketDelete?: (ticketId: string) => void;
}

export const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onTicketUpdate,
  onTicketDelete,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePropertyChange = async (field: 'status' | 'priority' | 'assignee', value: string) => {
    if (!ticket) return;
    
    try {
      setIsUpdating(true);
      
      const updates: Partial<SupportTicket> = {};
      if (field === 'status') updates.status = value as TicketStatus;
      if (field === 'priority') updates.priority = value as TicketPriority;
      if (field === 'assignee') updates.assignee = value || undefined;
      
      const updatedTicket = await updateTicket(ticket.id, updates);
      
      // Notify parent component about the update
      if (onTicketUpdate) {
        onTicketUpdate(updatedTicket);
      }
      
      toast({
        title: "Success",
        description: `Ticket ${field} updated successfully`,
      });
    } catch (error) {
      console.error(`Failed to update ticket ${field}:`, error);
      toast({
        title: "Error",
        description: `Failed to update ticket ${field}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTitleEdit = () => {
    if (!ticket) return;
    setEditTitle(ticket.title);
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (!ticket || !editTitle.trim()) return;
    
    try {
      setIsUpdating(true);
      const updatedTicket = await updateTicket(ticket.id, { title: editTitle.trim() });
      
      if (onTicketUpdate) {
        onTicketUpdate(updatedTicket);
      }
      
      setIsEditingTitle(false);
      toast({
        title: "Success",
        description: "Ticket title updated successfully",
      });
    } catch (error) {
      console.error('Failed to update ticket title:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket title. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setEditTitle('');
  };

  const handleDescriptionEdit = () => {
    if (!ticket) return;
    setEditDescription(ticket.description);
    setIsEditingDescription(true);
  };

  const handleDescriptionSave = async () => {
    if (!ticket || !editDescription.trim()) return;
    
    try {
      setIsUpdating(true);
      const updatedTicket = await updateTicket(ticket.id, { description: editDescription.trim() });
      
      if (onTicketUpdate) {
        onTicketUpdate(updatedTicket);
      }
      
      setIsEditingDescription(false);
      toast({
        title: "Success",
        description: "Ticket description updated successfully",
      });
    } catch (error) {
      console.error('Failed to update ticket description:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDescriptionCancel = () => {
    setIsEditingDescription(false);
    setEditDescription('');
  };

  const handleAddTag = async () => {
    if (!ticket || !newTag.trim()) return;
    
    const trimmedTag = newTag.trim();
    if (ticket.tags.includes(trimmedTag)) {
      toast({
        title: "Error",
        description: "Tag already exists",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);
      const updatedTags = [...ticket.tags, trimmedTag];
      const updatedTicket = await updateTicket(ticket.id, { tags: updatedTags });
      
      if (onTicketUpdate) {
        onTicketUpdate(updatedTicket);
      }
      
      setNewTag('');
      setShowTagInput(false);
      toast({
        title: "Success",
        description: "Tag added successfully",
      });
    } catch (error) {
      console.error('Failed to add tag:', error);
      toast({
        title: "Error",
        description: "Failed to add tag. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!ticket) return;
    
    try {
      setIsUpdating(true);
      const updatedTags = ticket.tags.filter(tag => tag !== tagToRemove);
      const updatedTicket = await updateTicket(ticket.id, { tags: updatedTags });
      
      if (onTicketUpdate) {
        onTicketUpdate(updatedTicket);
      }
      
      toast({
        title: "Success",
        description: "Tag removed successfully",
      });
    } catch (error) {
      console.error('Failed to remove tag:', error);
      toast({
        title: "Error",
        description: "Failed to remove tag. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Load comments when ticket changes
  useEffect(() => {
    if (ticket && isOpen) {
      loadComments();
    }
  }, [ticket?.id, isOpen]);

  const loadComments = async () => {
    if (!ticket) return;
    
    try {
      setIsLoadingComments(true);
      const ticketComments = await fetchTicketComments(ticket.id);
      setComments(ticketComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation history.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSendComment = async () => {
    if (!ticket || !newComment.trim() || !user) return;
    
    try {
      setIsSendingComment(true);
      
      const authorName = user.user_metadata?.full_name || user.email || 'Support Agent';
      const comment = await createTicketComment(
        ticket.id,
        user.id,
        authorName,
        newComment.trim(),
        isInternal
      );
      
      setComments(prev => [...prev, comment]);
      setNewComment('');
      setIsInternal(false);
    } catch (error) {
      console.error('Failed to send comment:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticket) return;

    try {
      await deleteTicket(ticket.id);
      toast({
        title: "Success",
        description: "Ticket deleted successfully",
      });
      onTicketDelete?.(ticket.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      toast({
        title: "Error",
        description: "Failed to delete ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString();
  };

  // Ensure body scroll is restored when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Force remove any overflow hidden that might persist
      document.body.style.overflow = 'unset';
      document.body.style.pointerEvents = 'auto';
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto" hideCloseButton={true}>
        {ticket && (
          <>
            <DialogHeader>
              {isEditingTitle ? (
                <div className="space-y-4">
                  {/* Edit Title Mode - Keep existing badges visible */}
                  <div className="flex items-center justify-between gap-4 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        ticket.priority === 'urgent' ? "bg-red-500" :
                        ticket.priority === 'high' ? "bg-orange-500" :
                        ticket.priority === 'medium' ? "bg-yellow-500" :
                        "bg-blue-500"
                      }`} />
                      <span className="text-xl font-bold flex-shrink-0">#{ticket.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        ticket.priority === 'urgent' ? "bg-red-100 text-red-800" :
                        ticket.priority === 'high' ? "bg-orange-100 text-orange-800" :
                        ticket.priority === 'medium' ? "bg-yellow-100 text-yellow-800" :
                        "bg-blue-100 text-blue-800"
                      }>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                      <Badge className={
                        ticket.status === 'new' ? "bg-blue-100 text-blue-800" :
                        ticket.status === 'in-progress' ? "bg-yellow-100 text-yellow-800" :
                        ticket.status === 'waiting-customer' ? "bg-purple-100 text-purple-800" :
                        "bg-green-100 text-green-800"
                      }>
                        {ticket.status.replace("-", " ").toUpperCase()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-6 w-6 p-0 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {/* Edit Input */}
                  <div className="space-y-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleTitleSave();
                        } else if (e.key === 'Escape') {
                          handleTitleCancel();
                        }
                      }}
                      className="text-xl font-bold"
                      disabled={isUpdating}
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleTitleSave}
                        disabled={!editTitle.trim() || isUpdating}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleTitleCancel}
                        disabled={isUpdating}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Main Header Row - All elements aligned */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      ticket.priority === 'urgent' ? "bg-red-500" :
                      ticket.priority === 'high' ? "bg-orange-500" :
                      ticket.priority === 'medium' ? "bg-yellow-500" :
                      "bg-blue-500"
                    }`} />
                    <span className="text-xl font-bold flex-shrink-0">#{ticket.id}</span>
                    <div className="group flex items-center gap-2 flex-1 min-w-0">
                      <DialogTitle className="text-xl font-bold truncate">
                        {ticket.title}
                      </DialogTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleTitleEdit}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        disabled={isUpdating}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={
                        ticket.priority === 'urgent' ? "bg-red-100 text-red-800" :
                        ticket.priority === 'high' ? "bg-orange-100 text-orange-800" :
                        ticket.priority === 'medium' ? "bg-yellow-100 text-yellow-800" :
                        "bg-blue-100 text-blue-800"
                      }>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                      <Badge className={
                        ticket.status === 'new' ? "bg-blue-100 text-blue-800" :
                        ticket.status === 'in-progress' ? "bg-yellow-100 text-yellow-800" :
                        ticket.status === 'waiting-customer' ? "bg-purple-100 text-purple-800" :
                        "bg-green-100 text-green-800"
                      }>
                        {ticket.status.replace("-", " ").toUpperCase()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-6 w-6 p-0 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {/* Metadata Row */}
                  <DialogDescription className="flex items-center gap-4 text-sm">
                    <span>
                      Created {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>
                      Last updated {new Date(ticket.updatedAt).toLocaleDateString()}
                    </span>
                  </DialogDescription>
                </div>
              )}
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Main Content - Ticket Details & Conversation */}
              <div className="lg:col-span-2 space-y-6">
                {/* Ticket Description */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Issue Description
                      </h3>
                      {!isEditingDescription && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleDescriptionEdit}
                          disabled={isUpdating}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <div className="px-6 pb-6">
                    {isEditingDescription ? (
                      <div className="space-y-3">
                        <div data-color-mode="light">
                          <MDEditor
                            value={editDescription}
                            onChange={(value) => setEditDescription(value || '')}
                            preview="edit"
                            hideToolbar={false}
                            visibleDragBar={false}
                            height={200}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={handleDescriptionSave}
                            disabled={!editDescription.trim() || isUpdating}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleDescriptionCancel}
                            disabled={isUpdating}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-headings:text-sm prose-p:text-sm prose-p:leading-relaxed prose-p:mb-3 prose-p:mt-0 prose-strong:font-bold prose-em:italic prose-code:bg-gray-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:text-gray-900 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-3 prose-pre:rounded prose-ul:mb-3 prose-ul:space-y-1 prose-ol:mb-3 prose-ol:space-y-1 prose-li:text-sm prose-h1:text-lg prose-h1:font-bold prose-h1:mb-2 prose-h2:text-base prose-h2:font-bold prose-h2:mb-2 prose-h3:text-sm prose-h3:font-bold prose-h3:mb-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre_code]:bg-transparent [&_pre_code]:text-gray-100">
                        <ReactMarkdown>
                          {ticket.description}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Conversation Thread */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Conversation History
                    </h3>
                  </CardHeader>
                  <div className="px-6 pb-6 space-y-4">
                    {isLoadingComments ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <>
                        {/* Comments */}
                        {comments.map((comment) => {
                          const isCurrentUser = user && comment.authorId === user.id;
                          return (
                            <div 
                              key={comment.id}
                              className={`flex gap-3 ${isCurrentUser ? 'bg-blue-50/50 -mx-3 px-3 py-2 rounded-lg' : ''}`}
                            >
                              <Avatar className="w-8 h-8">
                                <AvatarFallback 
                                  className={
                                    comment.isInternal 
                                      ? "bg-orange-100 text-orange-700" 
                                      : "bg-blue-100 text-blue-700"
                                  }
                                >
                                  {comment.authorName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">
                                    {isCurrentUser ? 'You' : comment.authorName}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {comment.isInternal ? 'Internal Note' : 'Agent'}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    •
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatTimeAgo(comment.createdAt)}
                                  </span>
                                </div>
                                <div 
                                  className={`rounded-lg p-3 ${
                                    comment.isInternal 
                                      ? 'bg-orange-50 border border-orange-200' 
                                      : 'bg-blue-50'
                                  }`}
                                >
                                  <div className="prose prose-sm max-w-none prose-headings:text-sm prose-p:text-sm prose-p:mb-2 prose-p:mt-0 prose-strong:font-bold prose-em:italic prose-code:bg-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:text-gray-900 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-3 prose-pre:rounded prose-ul:mb-2 prose-ol:mb-2 prose-li:mb-1 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre_code]:bg-transparent [&_pre_code]:text-gray-100">
                                    <ReactMarkdown>
                                      {comment.content}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {comments.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No conversation history yet</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Reply Box */}
                    <div className="border-t pt-4 mt-6">
                      <div className="space-y-3">
                        <div data-color-mode="light">
                          <MDEditor
                            value={newComment}
                            onChange={(value) => setNewComment(value || '')}
                            preview="edit"
                            hideToolbar={false}
                            visibleDragBar={false}
                            height={120}
                            placeholder="Type your response using markdown..."
                            data-disabled={isSendingComment || !user}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled>
                              <FileText className="w-4 h-4 mr-2" />
                              Template
                            </Button>
                            <Button variant="outline" size="sm" disabled>
                              <Tag className="w-4 h-4 mr-2" />
                              Canned Response
                            </Button>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="internal-note"
                                checked={isInternal}
                                onCheckedChange={setIsInternal}
                                disabled={isSendingComment || !user}
                              />
                              <Label htmlFor="internal-note" className="text-sm font-medium">
                                Internal Note
                              </Label>
                            </div>
                            <Button 
                              size="sm"
                              onClick={handleSendComment}
                              disabled={!newComment.trim() || isSendingComment || !user}
                            >
                              {isSendingComment ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                              ) : (
                                <Send className="w-4 h-4 mr-2" />
                              )}
                              {isInternal ? "Add Note" : "Send Reply"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar - Customer Info & Actions */}
              <div className="space-y-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Customer
                    </h3>
                  </CardHeader>
                  <div className="px-6 pb-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          {ticket.customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {ticket.customer.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.customer.email}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        disabled
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        disabled
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Customer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        disabled
                      >
                        <User className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Ticket Properties */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      Ticket Properties
                      {isUpdating && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </h3>
                  </CardHeader>
                  <div className="px-6 pb-6 space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <select 
                          className="w-full mt-1 p-2 border rounded-md text-sm"
                          value={ticket.status}
                          onChange={(e) => handlePropertyChange('status', e.target.value)}
                          disabled={isUpdating}
                        >
                          <option value="new">New</option>
                          <option value="in-progress">In Progress</option>
                          <option value="waiting-customer">
                            Waiting for Customer
                          </option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          Priority
                        </label>
                        <select 
                          className="w-full mt-1 p-2 border rounded-md text-sm"
                          value={ticket.priority}
                          onChange={(e) => handlePropertyChange('priority', e.target.value)}
                          disabled={isUpdating}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          Assignee
                        </label>
                        <select 
                          className="w-full mt-1 p-2 border rounded-md text-sm"
                          value={ticket.assignee || ''}
                          onChange={(e) => handlePropertyChange('assignee', e.target.value)}
                          disabled={isUpdating}
                        >
                          <option value="">Unassigned</option>
                          <option value="John Doe">John Doe</option>
                          <option value="Jane Smith">Jane Smith</option>
                          <option value="Mike Wilson">Mike Wilson</option>
                          <option value="Alex Chen">Alex Chen</option>
                          <option value="Sarah Kim">Sarah Kim</option>
                          <option value="Jennifer Lee">Jennifer Lee</option>
                          <option value="David Park">David Park</option>
                          <option value="Lisa Chang">Lisa Chang</option>
                          <option value="Tom Brown">Tom Brown</option>
                          <option value="Support Agent">Support Agent</option>
                          <option value="Product Team">Product Team</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Tags
                    </h3>
                  </CardHeader>
                  <div className="px-6 pb-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {ticket.tags.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No tags added</p>
                      ) : (
                        ticket.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs flex items-center gap-1 group hover:bg-red-100"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              disabled={isUpdating}
                              className="ml-1 text-muted-foreground hover:text-red-600 group-hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                    
                    {showTagInput ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter tag name..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddTag();
                              } else if (e.key === 'Escape') {
                                setShowTagInput(false);
                                setNewTag('');
                              }
                            }}
                            className="text-sm"
                            disabled={isUpdating}
                          />
                          <Button 
                            size="sm" 
                            onClick={handleAddTag}
                            disabled={!newTag.trim() || isUpdating}
                          >
                            Add
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setShowTagInput(false);
                            setNewTag('');
                          }}
                          className="w-full text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setShowTagInput(true)}
                        disabled={isUpdating}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Tag
                      </Button>
                    )}
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Quick Actions</h3>
                  </CardHeader>
                  <div className="px-6 pb-6 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      disabled
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Set Reminder
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      disabled
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Escalate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      disabled
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Ticket
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      onClick={handleDeleteTicket}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Ticket
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};