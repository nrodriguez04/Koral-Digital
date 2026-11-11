import Link from 'next/link';

export function Pagination({
  page,
  pageSize,
  total,
  basePath,
  params,
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const href = (p: number) => {
    const sp = new URLSearchParams(
      Object.entries({ ...params, page: String(p) }).filter(([, v]) => v) as [string, string][],
    );
    return `${basePath}?${sp.toString()}`;
  };
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="text-ink/60 flex items-center justify-between gap-3 px-4 py-3 text-sm">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={href(page - 1)}
            className="border-ink/10 hover:bg-ink/5 rounded-lg border bg-white px-3 py-1.5"
          >
            Previous
          </Link>
        ) : null}
        {page < pages ? (
          <Link
            href={href(page + 1)}
            className="border-ink/10 hover:bg-ink/5 rounded-lg border bg-white px-3 py-1.5"
          >
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}
