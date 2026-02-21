"use client";

import { Button, Column, Grid, Heading } from "@carbon/react";

export default function ErrorRedirectPage() {
  return (
    <Grid className="pt-8">
      <Column lg={16} md={8} sm={4}>
        <Heading className="mb-4" style={{ fontSize: 28 }}>
          Something went wrong
        </Heading>
        <p className="mb-6">An unexpected error occurred. Please try again.</p>
        <div className="flex gap-3">
          <Button kind="primary" onClick={() => window.location.assign("/")}>
            Go to dashboard
          </Button>
          <Button kind="secondary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </Column>
    </Grid>
  );
}
