import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WebsocketService } from './websocket.service';

const CHAT_URL = 'ws://lme.local:3000';

export interface Message {
	// author: string,
	// message: string
	//type:string,
	//json:any
}

@Injectable()
export class ChatService {
	public messages: Subject<Message>;

	constructor(private wsService: WebsocketService) {
		
	}

	public openConnection(){
		this.messages = <Subject<Message>>this.wsService
			.connect(CHAT_URL)
			.map((response: MessageEvent): Message => {
				//let data = JSON.parse(response.data);
				// return {
				// 	author: data.author,
				// 	message: data.message
				// }
				return response.data;
			});
	}

	public checkConnection(){
		return this.wsService.checkConnection();
	}
	public resetConnection(){
		this.wsService.resetConnection();
	}
}