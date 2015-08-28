Title:Emacs workflow
Slug:
Category:blog 
Date:
Tags:
Keywords:
Summary:
Status:draft

/usr/local/bin/emacs

    #!/bin/sh
    /Applications/Emacs.app/Contents/MacOS/Emacs "$@" &

/usr/local/bin/ec

    #!/bin/bash
    
    # This script starts emacs daemon if it is not running, opens whatever file
    # you pass in and changes the focus to emacs.  Without any arguments, it just
    # opens the current buffer or *scratch* if nothing else is open.  The following
    # example will open ~/.bashrc
    
    # ec ~/.bashrc
    
    # You can also pass it multiple files, it will open them all.  Unbury-buffer
    # will cycle through those files in order
    
    # The compliment to the script is et, which opens emacs in the terminal
    # attached to a daemon
    
    # If you want to execute elisp, pass in -e whatever.
    # You may also want to stop the output from returning to the terminal, like
    # ec -e "(message \"Hello\")" > /dev/null
    
    # emacsclient options for reference
    # -a "" starts emacs daemon and reattaches
    # -c creates a new frame
    # -n returns control back to the terminal
    # -e eval the script
    
    # Number of current visible frames,
    # Emacs daemon always has a visible frame called F1
    visible_frames() {
      emacsclient -a "" -e '(length (visible-frame-list))'
    }
    
    change_focus() {
      emacsclient -n -e "(select-frame-set-input-focus (selected-frame))" > /dev/null
    }
    
    
    # try switching to the frame incase it is just minimized
    # will start a server if not running
    test "$(visible_frames)" -eq "1" && change_focus
    
    if [ "$(visible_frames)" -lt  "2" ]; then # need to create a frame
      # -c $@ with no args just opens the scratch buffer
      emacsclient -n -c "$@" && change_focus
    else # there is already a visible frame besides the daemon, so
      change_focus
      # -n $@ errors if there are no args
      test  "$#" -ne "0" && emacsclient -n "$@"
    fi


/usr/local/bin/et

    #!/bin/zsh
    
    # Makes sure emacs daemon is running and opens the file in Emacs in
    # the terminal.
    
    # If you want to execute elisp, use -e whatever, like so
    
    # et -e "(message \"Word up\")"
    
    # You may want to redirect that to /dev/null if you don't want the
    # return to printed on the terminal.  Also, just echoing a message
    # may not be visible if Emacs then gives you a message about what
    # to do when do with the frame
    
    # The compliment to this script is ec
    
    # Emacsclient option reference
    # -a "" starts emacs daemon and reattaches
    # -t starts in terminal, since I won't be using the gui
    # can also pass in -n if you want to have the shell return right away
    
    exec emacsclient -a "emacsserver" -t "$@"
