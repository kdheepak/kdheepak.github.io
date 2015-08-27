Title:Emacs and TMUX workflow
Category:blog
Date: Jul 18 10:00:00 MDT 2015
Tags:emacs, osx
Keywords:emacsclient, terminal, workflow, tmux
Summary:Emacs and tmux workflow ...


I think [Michael Wall](http://mjwall.com/blog/2013/10/04/how-i-use-emacs/) nailed it when it comes to having a emacs workflow with the terminal. I've only added [small modifications]() to this in order to get it the way I like. 

I'm a big fan of the vim, tmux and zsh. I've been experimenting moving to emacs, and my first hurdle was getting a terminal to work well inside emacs. I played around with multiterm and found it crashed a couple of times. zsh was working really well for me and I decided to stick to using the same tool.

    ;; Many thanks to the author of and contributors to the following posts:                 
    ;; https://gist.github.com/mislav/5189704                                                
    ;; http://robots.thoughtbot.com/post/53022241323/seamlessly-navigate-vim-and-tmux-splits 
    ;;                                                                                       
    ;; TODO: Make a script that generates tmux and emacs code without duplication            
    ;;                                                                                       
    ;; NOTE: My keybindings are not the default emacs ones, using windmove                   
                                                                                            
    ;; Try to move direction, which is supplied as arg                                       
    ;; If cannot move that direction, send a tmux command to do appropriate move             
    (defun windmove-emacs-or-tmux(dir tmux-cmd)                                              
    (interactive)                                                                            
    (if (ignore-errors (funcall (intern (concat "windmove-" dir))))                          
    nil                       ;; Moving within emacs                                         
    (shell-command tmux-cmd)) ;; At edges, send command to tmux                              
    )                                                                                        
                                                                                            
    ;Move between windows with custom keybindings                                            
    (global-set-key (kbd "C-k")                                                              
       '(lambda () (interactive) (windmove-emacs-or-tmux "up"  "tmux select-pane -U")))     
    (global-set-key (kbd "C-j")                                                              
       '(lambda () (interactive) (windmove-emacs-or-tmux "down"  "tmux select-pane -D")))   
    (global-set-key (kbd "C-l")                                                              
       '(lambda () (interactive) (windmove-emacs-or-tmux "right" "tmux select-pane -R")))   
    (global-set-key (kbd "C-h")                                                              
       '(lambda () (interactive) (windmove-emacs-or-tmux "left"  "tmux select-pane -L")))   
