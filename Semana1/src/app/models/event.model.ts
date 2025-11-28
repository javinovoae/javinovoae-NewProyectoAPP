

export interface EventCreate {
    name: string;
    event_date: string;
    manager_id: number;
}

export interface Event {
    id: number;
    name: string;
    event_date: string;
    total_earnings: number;
    manager_id: number; 
}