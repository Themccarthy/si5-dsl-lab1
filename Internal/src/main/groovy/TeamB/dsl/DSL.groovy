package TeamB.dsl

import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.LogicalCondition
import org.codehaus.groovy.control.CompilerConfiguration
import org.codehaus.groovy.control.customizers.SecureASTCustomizer
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.SIGNAL;

class DSL {
    private GroovyShell shell
    private CompilerConfiguration configuration
    private DSLBinding binding
    private Basescript basescript

    DSL() {
        binding = new DSLBinding()
        binding.setModel(new Model(binding));
        configuration = getDSLConfiguration()
        configuration.setScriptBaseClass("TeamB.dsl.Basescript")
        shell = new GroovyShell(configuration)

        binding.setVariable("high", SIGNAL.HIGH)
        binding.setVariable("low", SIGNAL.LOW)
    }

    private static CompilerConfiguration getDSLConfiguration() {
        def secure = new SecureASTCustomizer()
        secure.with {
            //disallow closure creation
            closuresAllowed = true
            //disallow method definitions
            methodDefinitionAllowed = true
            //empty white list => forbid imports
            importsWhitelist = [
                    'java.lang.*'
            ]
            staticImportsWhitelist = []
            staticStarImportsWhitelist= []
            //language tokens disallowed
//			tokensBlacklist= []
            //language tokens allowed
            tokensWhitelist= []
            //types allowed to be used  (including primitive types)
            constantTypesClassesWhiteList= [
                    int, Integer, Number, Integer.TYPE, String, Object
            ]
            //classes who are allowed to be receivers of method calls
            receiversClassesWhiteList= [
                    int, Number, Integer, String, Object
            ]
        }

        def configuration = new CompilerConfiguration()
        configuration.addCompilationCustomizers(secure)

        return configuration
    }

    void eval(File scriptFile) {
        Script script = shell.parse(scriptFile)

        binding.setScript(script)
        script.setBinding(binding)

        script.run()
    }
}