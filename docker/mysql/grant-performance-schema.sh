#!/usr/bin/env bash

# BookingConcurrencyTest reads performance_schema.data_lock_waits to see that
# the second request is waiting on the car row lock.
if [ -n "$MYSQL_USER" ]; then
mysql --user=root --password="$MYSQL_ROOT_PASSWORD" <<-EOSQL
    GRANT SELECT ON performance_schema.* TO '$MYSQL_USER'@'%';
EOSQL
fi
