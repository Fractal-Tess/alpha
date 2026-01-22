<script lang="ts">
  // Temporarily commented out for shadcn testing
  // import { useQuery } from 'convex-svelte';
  // import { api } from "@lucid/backend/convex/_generated/api";
  import { Button } from '@lucid/ui/shadcn/button';

  // const healthCheck = useQuery(api.healthCheck.get, {});
  const healthCheck = { data: true, isLoading: false };

  const TITLE_TEXT = `
   ██████╗ ███████╗████████╗████████╗███████╗██████╗
   ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
   ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝
   ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗
   ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║
   ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

   ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
   ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
      ██║       ███████╗   ██║   ███████║██║     █████╔╝
      ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
      ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
      ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
   `;
</script>

<div class="container mx-auto max-w-3xl px-4 py-2">
  <pre class="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
  <div class="grid gap-6">
    <section class="rounded-lg border p-4">
      <h2 class="mb-2 font-medium">API Status</h2>
      <div class="flex items-center gap-2">
        <div
          class={`h-2 w-2 rounded-full ${healthCheck.data ? 'bg-green-500' : 'bg-red-500'}`}
        ></div>
        <span class="text-muted-foreground text-sm">
          {healthCheck.isLoading
            ? 'Checking...'
            : healthCheck.data
              ? 'Connected (Mock)'
              : 'Disconnected'}
        </span>
      </div>
    </section>
    <section class="rounded-lg border p-4">
      <h2 class="mb-4 font-medium">Shadcn Button Test</h2>
      <div class="flex gap-2">
        <Button>Default Button</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
      </div>
    </section>
  </div>
</div>
