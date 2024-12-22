import React from 'react';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Updated events with a wider range of dates for testing
const events = [
  {
    id: 1,
    title: 'Math Class',
    start: new Date(2023, 5, 1, 10, 0),
    end: new Date(2023, 5, 1, 11, 30),
    instructor: 'Dr. Smith',
    room: '101',
  },
  {
    id: 2,
    title: 'Physics Lab',
    start: new Date(2023, 5, 2, 14, 0),
    end: new Date(2023, 5, 2, 16, 0),
    instructor: 'Prof. Johnson',
    room: '205',
  },
  {
    id: 3,
    title: 'Literature Seminar',
    start: new Date(2023, 5, 5, 13, 0),
    end: new Date(2023, 5, 5, 14, 30),
    instructor: 'Dr. Williams',
    room: '302',
  },
  {
    id: 4,
    title: 'Chemistry Experiment',
    start: new Date(2023, 5, 8, 9, 0),
    end: new Date(2023, 5, 8, 12, 0),
    instructor: 'Prof. Brown',
    room: '405',
  },
  {
    id: 5,
    title: 'Computer Science Project',
    start: new Date(2023, 5, 10, 15, 0),
    end: new Date(2023, 5, 10, 17, 0),
    instructor: 'Dr. Davis',
    room: '201',
  },
];

export function LessonSchedule() {
  const ListItem = ({ event }: { event: any }) => (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold">{event.title}</h3>
      <p>{moment(event.start).format('MMMM Do, h:mm a')} - {moment(event.end).format('h:mm a')}</p>
      <p>Instructor: {event.instructor}</p>
      <p>Room: {event.room}</p>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Lesson Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <ListItem key={event.id} event={event} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

