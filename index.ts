import { RabbitmqServer } from "rabbit-server";

interface Notification {
    id: number;
    msg: string;
}

const notifications: Notification[] = [];
const notificationAdded = "notification.added";
const notificationDeleted = "notification.deleted";

const rabbitServer = new RabbitmqServer("amqp://admin:admin@localhost:5672");

async function start() {
    await rabbitServer.start();

    console.log("connected");

    rabbitServer.consume(notificationAdded, (message, context) => {
        const notification: Notification = JSON.parse(message);
        notifications.push(notification);
        console.log(`message received -> ${notificationAdded}`);
        context.success();
    });

    rabbitServer.consume(notificationDeleted, (message, context) => {
        const { id } = JSON.parse(message);

        const index = notifications.findIndex(
            (notification) => notification.id === id
        );
        console.log(`message received -> ${notificationDeleted}`);

        if (index !== -1) {
            notifications.splice(index, 1);
            console.log(notifications);
            context.success();
            return;
        }
        context.reject();
    });
}

start();

setInterval(() => {
    rabbitServer.publish(
        notificationAdded,
        JSON.stringify({
            msg: "asdkaskdkaskdk asdnotification",
            id: 59983828,
        })
    );
}, 700);

setInterval(() => {
    rabbitServer.publish(notificationDeleted, JSON.stringify({ id: 59983828 }));
}, 1000);
