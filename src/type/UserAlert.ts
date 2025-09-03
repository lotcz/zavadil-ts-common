export enum UserAlertType {
	info = 'info',
	warning = 'warning',
	error = 'danger'
}

export type UserAlert = {
	time: Date;
	type: UserAlertType;
	message: string;
	remainsMs?: number; //remain visible for this amount of seconds
}
