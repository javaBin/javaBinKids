interface ToastItem {
	id: number;
	message: string;
	type: 'success' | 'error';
}

let nextId = 0;

class Toast {
	items = $state<ToastItem[]>([]);

	show(message: string, type: 'success' | 'error' = 'success') {
		const id = nextId++;
		this.items.push({ id, message, type });
		setTimeout(() => this.dismiss(id), 3000);
	}

	dismiss(id: number) {
		this.items = this.items.filter((t) => t.id !== id);
	}
}

export const toast = new Toast();
