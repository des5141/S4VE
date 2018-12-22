///nn_disconnect()
{
    global.login = -1;
    global.uuid  = -1;
    //Kill the controller
    with (sys_nn) {
        network_destroy(client);
        instance_destroy();
    }
}
