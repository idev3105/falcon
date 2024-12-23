<script>
	let token = '';

	function handleCreate() {
		// Logic for creating a session or room
		console.log('Create button clicked');
	}

	function handleJoin() {
		// Go to share page with token as params
		window.location.href = `/share?token=${token}`;
	}
</script>

<main class="flex h-screen flex-col items-center justify-center">
	<h1 class="mb-4 text-2xl font-bold">Go Together</h1>
	<div class="flex items-center space-x-4">
		<form method="POST" action="/create">
			<input hidden />
			<button type="submit" class="btn w-16 rounded bg-primary px-4 py-2" onclick={handleCreate}>
				Create
			</button>
		</form>
		<div>Or</div>
		<form>
			<input
				type="text"
				bind:value={token}
				placeholder="Enter your token"
				class="rounded border px-2 py-1"
			/>
			<button class="btn mt-2 rounded px-4 py-2" onclick={handleJoin}> Join </button>
		</form>
	</div>
</main>
