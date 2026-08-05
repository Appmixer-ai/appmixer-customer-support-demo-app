import { useState, useCallback } from 'react';

interface UseEditableFieldOptions<T> {
  onSave?: (value: T) => Promise<void>;
  onCancel?: () => void;
}

/**
 * Custom hook for managing editable field state with edit/save/cancel functionality
 *
 * @example
 * const titleEditor = useEditableField(ticket.title, {
 *   onSave: async (newTitle) => {
 *     await updateTicket(ticketId, { title: newTitle });
 *   }
 * });
 *
 * // In your component:
 * {titleEditor.isEditing ? (
 *   <Input
 *     value={titleEditor.editValue}
 *     onChange={(e) => titleEditor.setEditValue(e.target.value)}
 *   />
 *   <Button onClick={titleEditor.handleSave} disabled={titleEditor.isSaving}>Save</Button>
 *   <Button onClick={titleEditor.handleCancel}>Cancel</Button>
 * ) : (
 *   <div onClick={titleEditor.startEditing}>{titleEditor.value}</div>
 * )}
 */
export function useEditableField<T>(
  initialValue: T,
  options: UseEditableFieldOptions<T> = {}
) {
  const { onSave, onCancel } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [editValue, setEditValue] = useState<T>(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = useCallback(() => {
    setEditValue(value);
    setIsEditing(true);
  }, [value]);

  const handleSave = useCallback(async () => {
    if (onSave) {
      try {
        setIsSaving(true);
        await onSave(editValue);
        setValue(editValue);
        setIsEditing(false);
      } catch (error) {
        // Error handling is delegated to the onSave callback
        throw error;
      } finally {
        setIsSaving(false);
      }
    } else {
      setValue(editValue);
      setIsEditing(false);
    }
  }, [editValue, onSave]);

  const handleCancel = useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
    onCancel?.();
  }, [value, onCancel]);

  const updateValue = useCallback((newValue: T) => {
    setValue(newValue);
    if (!isEditing) {
      setEditValue(newValue);
    }
  }, [isEditing]);

  return {
    // Current committed value
    value,
    setValue: updateValue,

    // Edit mode state
    isEditing,
    setIsEditing,
    startEditing,

    // Editing value (temporary)
    editValue,
    setEditValue,

    // Saving state
    isSaving,

    // Actions
    handleSave,
    handleCancel,
  };
}
