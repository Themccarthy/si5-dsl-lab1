package main;

import dsl.DSL;

import java.io.File;

public class Main {
    public static void main(String[] args) {
        DSL dsl = new DSL();
        if(args.length > 0) {
            dsl.eval(new File(args[0]));
        } else {
            System.out.println("/!\\ Missing arg: Please specify the path to a Groovy script file to execute");
        }
    }

}
