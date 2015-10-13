public static final char[] WHITE_SPACE = " \t\r\n".toCharArray();
public static final char[] GLSL_SPECIAL_CHAR = ";,.[](){}-+/*=><^&|!: \t\r\n".toCharArray();
public static String minimalGLSL(String s){
    StringBuilder parsed = new StringBuilder();
    
    s = s.trim();
    
    boolean directiveAddLine = true;
    
    main:for (int i = 0; i < s.length(); i++){
        char c = s.charAt(i);
        
        //check for comments
        if (i < s.length() - 1 && c == '/' && s.charAt(i + 1) == '/'){
            i += 2;
            
            boolean end = false;
            
            for (int ii = i; ii < s.length(); ii++){
                char cc = s.charAt(ii);
                
                boolean white = false;
                
                if (!end){
                    end = cc == '\r' || cc == '\n';
                }
                
                for (int iii = 0; iii < WHITE_SPACE.length; iii++){
                    if (WHITE_SPACE[iii] == cc){
                        white = true;
                    }
                }
                
                if (white){
                    i++;
                }else if (end){
                    break;
                }else{
                    i++;
                }
            }
            
            i--;
            continue main;
        }
        
        //check for any directives
        if (c == '#'){
            //find next line break and insert line breaks where needed
            
            int ii;
            
            for (ii = i + 1; ii < s.length(); ii++){
                char cc = s.charAt(ii);
                
                if (cc == '\n' || cc == '\r'){
                    break;
                }
            }
            
            if (directiveAddLine){
                parsed.append("\\r\\n");
            }else{
                directiveAddLine = true;
            }
            
            parsed.append(s.substring(i, ii));
            parsed.append("\\r\\n");
            
            //find next valid character
            for (; ii < s.length(); ii++){
                char cc = s.charAt(ii);
                
                boolean cwhite = false;
                
                for (int iii = 0; iii < WHITE_SPACE.length; iii++){
                    if (WHITE_SPACE[iii] == cc){
                        cwhite = true;
                        break;
                    }
                }
                
                if (!cwhite){
                    if (s.charAt(ii) == '#'){
                        directiveAddLine = false;
                    }
                    
                    ii--;
                    
                    break;
                }
            }
            
            i = ii;
        }else{
            boolean special = false;
            
            for (int ii = 0; ii < GLSL_SPECIAL_CHAR.length; ii++){
                if (GLSL_SPECIAL_CHAR[ii] == c){
                    special = true;
                    break;
                }
            }
            
            if (special){
                boolean cwhite = false;
                
                for (int ii = 0; ii < WHITE_SPACE.length; ii++){
                    if (WHITE_SPACE[ii] == c){
                        cwhite = true;
                        break;
                    }
                }
                
                if (parsed.length() > 0){
                    int ii;
                    
                    for (ii = parsed.length() - 1; ii >= 0; ii--){
                        boolean white = false;
                        
                        for (int iii = 0; iii < WHITE_SPACE.length; iii++){
                            if (WHITE_SPACE[iii] == parsed.charAt(ii)){
                                white = true;
                                break;
                            }
                        }
                        
                        if (!white){
                            ii++;
                            break;
                        }
                    }
                    
                    parsed.setLength(ii);
                }
                
                for (int ii = i + 1; ii < s.length(); ii++){
                    boolean white = false;
                    
                    for (int iii = 0; iii < WHITE_SPACE.length; iii++){
                        if (WHITE_SPACE[iii] == s.charAt(ii)){
                            white = true;
                            break;
                        }
                    }
                    
                    if (white){
                        i++;
                    }else{
                        break;
                    }
                }
                
                if (cwhite){
                    parsed.append(' ');
                }else{
                    parsed.append(c);
                }
            }else{
                parsed.append(c);
            }
        }
    }
    
    return parsed.toString();
}
