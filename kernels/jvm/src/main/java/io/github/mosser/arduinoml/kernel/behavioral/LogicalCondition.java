package jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral;

public enum LogicalCondition {
    AND("&&"),
    OR("||"),
    NONE("");

    private final String operator;

    LogicalCondition(String operator) {
        this.operator = operator;
    }

    public String getOperator() {
        return operator;
    }
}
