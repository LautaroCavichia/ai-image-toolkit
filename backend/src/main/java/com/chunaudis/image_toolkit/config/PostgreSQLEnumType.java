package com.chunaudis.image_toolkit.config;

import org.hibernate.type.EnumType;
import java.sql.Types;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;
    
public class PostgreSQLEnumType<T extends Enum<T>> extends EnumType<T> {
    @Override
    public int getSqlType() {
        return Types.OTHER;
    }
}
