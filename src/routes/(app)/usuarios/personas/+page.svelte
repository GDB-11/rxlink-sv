<!-- src/routes/(app)/usuarios/personas/+page.svelte -->
<script lang="ts">
    import PersonsPage from '$lib/features/persons/components/PersonsPage.svelte';
</script>

<svelte:head>
    <title>Personas — RxLink</title>
</svelte:head>

<PersonsPage title="Personas" description="Gestión del catálogo de personas" />
