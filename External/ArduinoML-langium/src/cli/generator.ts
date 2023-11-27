
import * as fs from 'node:fs';
import { CompositeGeneratorNode, toString } from 'langium';
import * as path from 'node:path';
import { extractDestinationAndName } from './cli-util.js';
import { App} from '../language/generated/ast.js';


export function generateInoFile(app: App, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.ino`;

    const fileNode = new CompositeGeneratorNode();
   // compile(app,fileNode)
    
    
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}
