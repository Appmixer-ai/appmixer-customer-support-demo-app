# SectionHeader Component Usage Examples

The `SectionHeader` component is a reusable component that standardizes the header patterns found throughout the application. Here are examples of how to replace existing header patterns.

## Basic Usage (Title + Description only)

**Before:**
```tsx
<div>
  <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
  <p className="text-muted-foreground">
    View and manage customer information
  </p>
</div>
```

**After:**
```tsx
<SectionHeader
  title="Customers"
  description="View and manage customer information"
/>
```

## With Primary Action Button

**Before (from WorkflowsSection):**
```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
    <p className="text-muted-foreground">
      Automate your support processes with AI-powered workflows
    </p>
  </div>
  <div className="flex items-center gap-2">
    <Button size="sm" onClick={onNewWorkflowClick}>
      <Plus className="w-4 h-4" />
      New Workflow
    </Button>
  </div>
</div>
```

**After:**
```tsx
<SectionHeader
  title="Workflows"
  description="Automate your support processes with AI-powered workflows"
  primaryAction={{
    label: "New Workflow",
    icon: <Plus className="w-4 h-4" />,
    onClick: onNewWorkflowClick
  }}
/>
```

## With Secondary Actions and Dropdown

**Before (from IntegrationsSection):**
```tsx
<div className="flex items-start justify-between">
  <div>
    <h1 className="text-3xl font-bold tracking-tight">
      Integrations (Apps)
    </h1>
    <p className="text-muted-foreground">
      Here you can activate ready-made integration workflows, with just a few clicks
    </p>
  </div>
  <div className="flex items-center gap-2">
    <div className="flex gap-1">
      <Button variant="secondary" size="sm">People tasks</Button>
      <Button variant="secondary" size="sm">Logs</Button>
      <Button variant="secondary" size="sm">Accounts</Button>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Storages</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>
```

**After:**
```tsx
<SectionHeader
  title="Integrations (Apps)"
  description="Here you can activate ready-made integration workflows, with just a few clicks"
  secondaryActions={[
    { label: "People tasks", onClick: () => {} },
    { label: "Logs", onClick: () => {} },
    { label: "Accounts", onClick: () => {} }
  ]}
  dropdownActions={[
    { label: "Storages", onClick: () => {} }
  ]}
/>
```

## With Primary and Dropdown Actions

**Before (from WorkflowsSection with dropdown):**
```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
    <p className="text-muted-foreground">
      Automate your support processes with AI-powered workflows
    </p>
  </div>
  <div className="flex items-center gap-2">
    <Button size="sm" onClick={onNewWorkflowClick}>
      <Plus className="w-4 h-4" />
      New Workflow
    </Button>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Storages</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>
```

**After:**
```tsx
<SectionHeader
  title="Workflows"
  description="Automate your support processes with AI-powered workflows"
  primaryAction={{
    label: "New Workflow",
    icon: <Plus className="w-4 h-4" />,
    onClick: onNewWorkflowClick
  }}
  dropdownActions={[
    { label: "Storages", onClick: () => {} }
  ]}
/>
```

## Component Props

```typescript
interface SectionHeaderProps {
  title: string;                    // Required: Main section title
  description: string;              // Required: Description text
  primaryAction?: {                 // Optional: Main action button
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
  };
  secondaryActions?: Array<{        // Optional: Additional action buttons
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
  }>;
  dropdownActions?: Array<{         // Optional: Dropdown menu items
    label: string;
    onClick: () => void;
  }>;
  className?: string;               // Optional: Additional CSS classes
}
```

## Benefits

1. **Consistency**: Ensures all section headers follow the same design pattern
2. **Maintainability**: Changes to header styling only need to be made in one place
3. **Flexibility**: Supports various combinations of actions and buttons
4. **Type Safety**: Full TypeScript support with proper typing
5. **Reusability**: Can be used across all sections in the application

## Integration Notes

- The component automatically handles layout (flex justify-between) when actions are present
- Icons are optional and can be passed as React nodes
- Button variants and sizes can be customized per action
- The component follows the existing design system from the codebase