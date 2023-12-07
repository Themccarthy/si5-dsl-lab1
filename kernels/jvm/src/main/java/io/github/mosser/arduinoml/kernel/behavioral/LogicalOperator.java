package jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral;

public enum LogicalOperator {
    AND("&&"),
    OR("||"),
    NONE("");

    private final String operator;

    LogicalOperator(String operator) {
        this.operator = operator;
    }

    public String getOperator() {
        return operator;
    }
}
