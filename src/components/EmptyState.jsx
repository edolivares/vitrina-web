import { Button } from '@/components/ui/button';

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, actionHref }) {
  const action = actionLabel && (onAction || actionHref);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-800 py-16 px-6 text-center text-slate-500">
      {Icon && <Icon className="size-9 text-slate-700" />}
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
        {description && <p className="max-w-sm text-xs text-slate-500">{description}</p>}
      </div>
      {action && (
        <Button asChild={Boolean(actionHref)} type="button" variant="outline" size="sm" onClick={onAction}>
          {actionHref ? <a href={actionHref}>{actionLabel}</a> : actionLabel}
        </Button>
      )}
    </div>
  );
}
