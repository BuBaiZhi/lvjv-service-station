<template>
	<div class="content">
		<img class="logo" src="/static/logo.png" alt="logo" />
		<div class="text-area">
			<span class="title">{{ title }}</span>
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello'
			}
		},
		onLoad() {

		},
		methods: {

		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100vh;
	}

	.logo {
		height: 100px;
		width: 100px;
		margin-top: 100px;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 25px;
		object-fit: contain;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 18px;
		color: #8f8f94;
	}
</style>
