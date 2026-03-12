package com.jaya.automation.core.util;

@FunctionalInterface
public interface CheckedSupplier<T> {
    T get() throws Exception;
}
