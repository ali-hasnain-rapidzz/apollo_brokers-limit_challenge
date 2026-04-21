# Solution Notes

## How to Run

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_submissions
python manage.py runserver 0.0.0.0:8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000/submissions`.

---

## Approach

### Backend

Extended the provided scaffold rather than replacing it. The three priority areas were filtering, query efficiency, and serializer design.

**Filtering** — `SubmissionFilterSet` was extended with all required and stretch filters:

| Param | Type | Behaviour |
|---|---|---|
| `status` | string | Case-insensitive exact match (was pre-wired) |
| `brokerId` | number | Exact FK match |
| `companySearch` | string | `icontains` on `company__legal_name` |
| `hasDocuments` | boolean | Reverse FK existence check with `distinct()` |
| `hasNotes` | boolean | Reverse FK existence check with `distinct()` |
| `createdFrom` | date | `date__gte` on `created_at` |
| `createdTo` | date | `date__lte` on `created_at` |

**Query efficiency** — The list endpoint uses Django ORM `annotate()` with `Count` (distinct) and correlated `Subquery` + `OuterRef` to pull document counts, note counts, and the latest note preview in a single SQL query. No N+1 on list views.

**Broker search** — `BrokerViewSet` was given `SearchFilter` on `name` and `pagination_class = None` to support the frontend's server-side searched autocomplete without a pagination envelope.

### Frontend

All filter state lives in the URL (`?status=new&brokerId=3&createdFrom=2026-01-01`) so filters are shareable, bookmarkable, and survive refresh. Local state is only used as a buffer for debounced inputs (company search, broker search) to avoid firing a request on every keystroke.

**Submissions list** — MUI table with status/priority chips, document and note counts, latest note preview, and row-click navigation. Loading skeleton rows, empty state, and error alert are all handled.

**Broker autocomplete** — replaced the static select with a server-side searched `Autocomplete` component. Input is debounced 400ms before the API is called so only the final typed value hits the backend.

**Detail page** — four sections: overview (broker, company, owner, dates), contacts table with mailto links, documents list with type chips, notes thread. Loading skeletons and per-section empty states throughout.

**Pagination** — MUI `Pagination` component driven by the `count` field from the API. `keepPreviousData` on the React Query hook prevents the table from flashing blank between page transitions.

---

## Tradeoffs

- **`distinct()` vs `Exists` for boolean filters** — `hasDocuments`/`hasNotes` use `filter(relation__isnull=False).distinct()` which is a LEFT JOIN. A correlated `Exists` subquery would short-circuit on the first matching row and skip `distinct()` entirely. Kept the JOIN approach for readability; worth swapping to `Exists` before any load testing.

- **Native date inputs** — used `<input type="date">` via MUI `TextField` rather than pulling in `@mui/x-date-pickers`. Cross-browser rendering is inconsistent (notably older Safari). The picker library with a `dayjs` adapter would be the production-ready choice.

- **Broker autocomplete loads all on empty input** — when the broker field is focused with no query typed, the hook fetches all brokers. Cleaner UX would only fetch once the user starts typing (`enabled: inputValue.length > 0`). Left as a known gap.

- **No `hasDocuments=false` UI** — the checkboxes only expose the "has" side of the filter. The `false` case (submissions without documents/notes) is reachable directly via URL but not through the UI. A tri-state control ("Any / Has / None") would cover it.

---

## Stretch Goals Implemented

- `hasDocuments` and `hasNotes` boolean filters — backend + frontend
- `createdFrom` / `createdTo` date range filters — backend + frontend
- Server-side searched broker autocomplete with 400ms debounce
- `keepPreviousData` on pagination for smooth page transitions
- Full detail page with contacts, documents, and notes sections
- All filter state persisted in URL params
