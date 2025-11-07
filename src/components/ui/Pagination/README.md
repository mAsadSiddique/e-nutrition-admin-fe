# Pagination Hook and Component

This directory contains a generic pagination solution that can be used across different components in the application.

## Files

- `Pagination.tsx` - Reusable pagination component
- `index.ts` - Export file
- `README.md` - This documentation

## Usage

### 1. Using the Pagination Hook

The `usePagination` hook provides all the pagination logic and state management:

```tsx
import { usePagination } from "@src/hooks";

const MyComponent = () => {
  const data = [
    /* your data array */
  ];

  const {
    paginatedData, // Current page data
    totalItems, // Total number of items
    totalPages, // Total number of pages
    page, // Current page number
    rowsPerPage, // Items per page
    rowsPerPageOptions, // Available options for rows per page
    startIndex, // Start index of current page
    endIndex, // End index of current page
    hasNextPage, // Boolean for next page availability
    hasPreviousPage, // Boolean for previous page availability
    setPage, // Function to change page
    setRowsPerPage, // Function to change rows per page
    goToPage, // Function to go to specific page
    goToNextPage, // Function to go to next page
    goToPreviousPage, // Function to go to previous page
    goToFirstPage, // Function to go to first page
    goToLastPage, // Function to go to last page
    resetPagination, // Function to reset pagination
  } = usePagination({
    data: data,
    initialPage: 1,
    initialRowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
  });

  return (
    <div>
      {/* Your table or list using paginatedData */}
      {paginatedData.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

### 2. Using the Pagination Component

The `Pagination` component provides a complete pagination UI:

```tsx
import { Pagination } from "@src/components/ui";

const MyComponent = () => {
  const {
    paginatedData,
    totalItems,
    totalPages,
    page,
    rowsPerPage,
    rowsPerPageOptions,
    startIndex,
    endIndex,
    setPage,
    setRowsPerPage,
  } = usePagination({
    data: data,
    initialPage: 1,
    initialRowsPerPage: 10,
  });

  return (
    <div>
      {/* Your content */}
      {paginatedData.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}

      {/* Pagination component */}
      <Pagination
        page={page}
        rowsPerPage={rowsPerPage}
        totalItems={totalItems}
        totalPages={totalPages}
        rowsPerPageOptions={rowsPerPageOptions}
        startIndex={startIndex}
        endIndex={endIndex}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        showRowsPerPage={true}
        showPageInfo={true}
        showFirstLastButtons={true}
        size="medium"
        variant="text"
        shape="rounded"
        color="primary"
      />
    </div>
  );
};
```

### 3. Customizing the Pagination Component

The `Pagination` component accepts various props for customization:

```tsx
<Pagination
  // Required props
  page={page}
  rowsPerPage={rowsPerPage}
  totalItems={totalItems}
  totalPages={totalPages}
  rowsPerPageOptions={rowsPerPageOptions}
  startIndex={startIndex}
  endIndex={endIndex}
  onPageChange={setPage}
  onRowsPerPageChange={setRowsPerPage}
  // Optional props
  showRowsPerPage={true} // Show/hide rows per page selector
  showPageInfo={true} // Show/hide page info text
  showFirstLastButtons={true} // Show/hide first/last page buttons
  size="medium" // 'small' | 'medium' | 'large'
  variant="text" // 'text' | 'outlined'
  shape="rounded" // 'circular' | 'rounded'
  color="primary" // 'primary' | 'secondary' | 'standard'
  className="custom-class" // Custom CSS class
  sx={
    {
      /* custom styles */
    }
  } // Custom Material-UI styles
/>
```

## Features

- **Generic**: Works with any data type
- **Responsive**: Automatically adapts to mobile/desktop
- **Customizable**: Multiple props for styling and behavior
- **Accessible**: Follows Material-UI accessibility guidelines
- **Type-safe**: Full TypeScript support
- **Performance**: Memoized calculations and data slicing

## Example Implementation

See `src/view/Admin/AdminListing/AdminListing.tsx` for a complete example of how to use both the hook and component together.
