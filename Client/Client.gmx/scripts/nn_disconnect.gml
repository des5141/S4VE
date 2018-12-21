///nn_disconnect()
{
    //Kill the controller
    with (sys_nn) {
        network_destroy(client);
        instance_destroy();
    }
}
