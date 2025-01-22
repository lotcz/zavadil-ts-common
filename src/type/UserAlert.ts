export enum UserAlertType {
	info = 'info',
	warning = 'warning',
	error = 'danger'
}

export type UserAlert = {
	time: Date;
	type: UserAlertType;
	message: string;
}
